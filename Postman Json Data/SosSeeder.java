import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Random;

public class SosSeeder {
    // Cấu hình URL
    private static final String BASE_URL = "http://localhost:8080";
    private static final String REGISTER_URL = BASE_URL + "/auth/signup";
    private static final String LOGIN_URL = BASE_URL + "/auth/login";
    private static final String SOS_URL = BASE_URL + "/sos";

    public static void main(String[] args) {
        try {
            System.out.println("🚀 BẮT ĐẦU SEEDER...");

            // 1. Tạo tài khoản mẫu (Mật khẩu chuẩn 123456)
            registerUser("admin@dongbaooi.com", "123456", "Admin User", "ADMIN");
            registerUser("user1@gmail.com", "123456", "Nguyen Van A", "USER");
            registerUser("user2@gmail.com", "123456", "Tran Thi B", "USER");

            // 2. Dữ liệu SOS cứng
            String[] sosMessages = {
                "{\"message\": \"Nước lũ dâng cao ngập mái nhà\", \"latitude\": 16.047, \"longitude\": 108.206, \"image\": \"https://via.placeholder.com/150\"}",
                "{\"message\": \"Sạt lở đất chắn ngang đường\", \"latitude\": 15.880, \"longitude\": 107.809, \"image\": \"https://via.placeholder.com/150\"}",
                "{\"message\": \"Cần lương thực khẩn cấp\", \"latitude\": 16.463, \"longitude\": 107.590, \"image\": \"https://via.placeholder.com/150\"}",
                "{\"message\": \"Người già bị thương cần y tế\", \"latitude\": 17.481, \"longitude\": 106.600, \"image\": \"https://via.placeholder.com/150\"}",
                "{\"message\": \"Bão to tốc mái nhà\", \"latitude\": 18.679, \"longitude\": 105.681, \"image\": \"https://via.placeholder.com/150\"}"
            };

            String[] testEmails = {"admin@dongbaooi.com", "user1@gmail.com", "user2@gmail.com"};
            Random random = new Random();

            System.out.println("\n⏳ Đang gửi dữ liệu SOS...");

            for (String sosJson : sosMessages) {
                String email = testEmails[random.nextInt(testEmails.length)];
                
                // Đăng nhập lấy token
                String loginJson = String.format("{\"email\":\"%s\",\"password\":\"123456\"}", email);
                String loginResponse = sendPostRequest(LOGIN_URL, loginJson, null);

                if (loginResponse == null || !loginResponse.contains("accessToken")) {
                    System.err.println("❌ BỎ QUA: Không đăng nhập được " + email + " (Có thể do lỗi tạo user trước đó).");
                    continue;
                }

                String token = extractToken(loginResponse);
                
                // Gửi SOS
                String sosResponse = sendPostRequest(SOS_URL, sosJson, token);
                if (sosResponse != null && sosResponse.contains("id")) {
                    System.out.println("✅ Gửi thành công bởi " + email);
                } else {
                    System.err.println("❌ Gửi thất bại bởi " + email);
                }
            }
            System.out.println("\n🎉 HOÀN TẤT!");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void registerUser(String email, String password, String fullname, String role) {
        String jsonBody = String.format(
            "{\"email\":\"%s\",\"password\":\"%s\",\"fullname\":\"%s\",\"role\":\"%s\"}", 
            email, password, fullname, role
        );
        String res = sendPostRequest(REGISTER_URL, jsonBody, null);
        if (res != null) {
             System.out.println("ℹ️ Đã gửi lệnh tạo user: " + email);
        }
    }

    // Hàm gửi Request ĐÃ SỬA LỖI NULL POINTER
    private static String sendPostRequest(String urlStr, String jsonBody, String token) {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlStr);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            if (token != null) {
                conn.setRequestProperty("Authorization", "Bearer " + token);
            }
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder response = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    return response.toString();
                }
            } else {
                // SỬA LỖI: Kiểm tra null trước khi đọc ErrorStream
                InputStream errorStream = conn.getErrorStream();
                if (errorStream != null) {
                    try (BufferedReader br = new BufferedReader(new InputStreamReader(errorStream, StandardCharsets.UTF_8))) {
                        StringBuilder errorResponse = new StringBuilder();
                        String responseLine;
                        while ((responseLine = br.readLine()) != null) {
                            errorResponse.append(responseLine.trim());
                        }
                        System.err.println("⚠️ API Error (" + responseCode + "): " + errorResponse.toString());
                    }
                } else {
                     System.err.println("⚠️ API Error (" + responseCode + "): [Không có nội dung lỗi chi tiết từ Server]");
                }
                return null;
            }
        } catch (IOException e) {
            System.err.println("⚠️ Connection Error: " + e.getMessage());
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static String extractToken(String response) {
        try {
            int idx = response.indexOf("accessToken");
            if (idx == -1) return null;
            int start = response.indexOf(":", idx) + 2;
            int end = response.indexOf("\"", start);
            return response.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }
}