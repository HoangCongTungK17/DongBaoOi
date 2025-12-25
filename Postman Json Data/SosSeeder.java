import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SosSeeder {
    // Cấu hình URL (Đã chuẩn hóa theo Backend của bạn)
    private static final String BASE_URL = "http://localhost:8080";
    private static final String REGISTER_URL = BASE_URL + "/auth/register";
    private static final String LOGIN_URL = BASE_URL + "/auth/authenticate";
    private static final String SOS_URL = BASE_URL + "/sos";

    // Đường dẫn file json (Lưu ý: Đảm bảo thư mục này tồn tại)
    private static final String JSON_FILE_PATH = "Postman Json Data/sos_data.json";

    public static void main(String[] args) {
        try {
            System.out.println("🚀 BẮT ĐẦU SEEDER (CHẾ ĐỘ ĐỌC FILE)...");
            
            // 1. Kiểm tra file tồn tại
            File file = new File(JSON_FILE_PATH);
            if (!file.exists()) {
                // Thử tìm ở thư mục gốc nếu không thấy trong thư mục con
                file = new File("sos_data.json");
            }
            
            if (!file.exists()) {
                System.err.println("❌ LỖI: Không tìm thấy file 'sos_data.json'.");
                System.err.println("👉 Hãy chắc chắn bạn đã tạo file này trong thư mục dự án.");
                return;
            }
            System.out.println("📂 Đã tìm thấy file dữ liệu: " + file.getAbsolutePath());

            // 2. Tạo tài khoản mẫu
            registerUser("admin@dongbaooi.com", "123456", "Admin User", "ADMIN");
            registerUser("user1@gmail.com", "123456", "Nguyen Van A", "USER");
            registerUser("user2@gmail.com", "123456", "Tran Thi B", "USER");

            // 3. Đọc và Parse dữ liệu từ file JSON
            String jsonContent = Files.readString(file.toPath(), StandardCharsets.UTF_8).trim();
            List<String> sosRequests = parseJsonArray(jsonContent);

            if (sosRequests.isEmpty()) {
                System.out.println("⚠️ File JSON rỗng hoặc sai định dạng.");
                return;
            }
            System.out.println("📦 Tìm thấy " + sosRequests.size() + " bản ghi SOS trong file.");

            // 4. Gửi dữ liệu
            String[] testEmails = {"admin@dongbaooi.com", "user1@gmail.com", "user2@gmail.com"};
            Random random = new Random();

            System.out.println("\n⏳ Đang gửi dữ liệu SOS...");

            for (String sosJson : sosRequests) {
                String email = testEmails[random.nextInt(testEmails.length)];
                
                // Đăng nhập lấy token
                String loginJson = String.format("{\"email\":\"%s\",\"password\":\"123456\"}", email);
                String loginResponse = sendPostRequest(LOGIN_URL, loginJson, null);

                if (loginResponse == null || (!loginResponse.contains("accessToken") && !loginResponse.contains("token"))) {
                    System.err.println("❌ BỎ QUA: " + email + " (Đăng nhập thất bại)");
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

    // Hàm Parse JSON thủ công (Tốt hơn cách split cũ)
    private static List<String> parseJsonArray(String json) {
        List<String> items = new ArrayList<>();
        // Tìm tất cả các đoạn nằm trong dấu ngoặc nhọn {}
        Pattern pattern = Pattern.compile("\\{.*?\\}", Pattern.DOTALL); 
        Matcher matcher = pattern.matcher(json);
        while (matcher.find()) {
            items.add(matcher.group());
        }
        return items;
    }

    private static void registerUser(String email, String password, String fullname, String role) {
        String jsonBody = String.format(
            "{\"email\":\"%s\",\"password\":\"%s\",\"fullname\":\"%s\",\"role\":\"%s\"}", 
            email, password, fullname, role
        );
        String res = sendPostRequest(REGISTER_URL, jsonBody, null);
        if (res != null) System.out.println("ℹ️ Đã gửi lệnh tạo user: " + email);
    }

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
                InputStream errorStream = conn.getErrorStream();
                if (errorStream != null) {
                     try (BufferedReader br = new BufferedReader(new InputStreamReader(errorStream, StandardCharsets.UTF_8))) {
                        // Đọc lỗi nhưng không in ra quá nhiều để đỡ rối mắt, chỉ in mã lỗi
                    }
                }
                return null;
            }
        } catch (IOException e) {
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static String extractToken(String response) {
        try {
            int idx = response.indexOf("accessToken");
            if (idx == -1) idx = response.indexOf("token");
            if (idx == -1) return null;
            int start = response.indexOf(":", idx) + 2; 
            int end = response.indexOf("\"", start);
            return response.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }
}