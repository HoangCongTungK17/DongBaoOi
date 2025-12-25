import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Random;

public class SosSeeder {
    private static final String LOGIN_URL = "http://localhost:8080/auth/login"; // Chuyển sang login
    private static final String SOS_URL = "http://localhost:8080/sos";

    public static void main(String[] args) throws Exception {
        String jsonArray = Files.readString(Paths.get("sos_data.json")).trim();
        if (jsonArray.startsWith("[")) jsonArray = jsonArray.substring(1);
        if (jsonArray.endsWith("]")) jsonArray = jsonArray.substring(0, jsonArray.length() - 1);
        String[] sosRequests = jsonArray.split("\\},\\s*\\{");

        // TỐI ƯU: Danh sách người dùng đã có sẵn trong hệ thống
        String[] testEmails = {"admin@dongbaooi.com", "user1@gmail.com", "user2@gmail.com"};
        Random random = new Random();

        for (String sos : sosRequests) {
            if (!sos.startsWith("{")) sos = "{" + sos;
            if (!sos.endsWith("}")) sos = sos + "}";

            // TỐI ƯU: Chọn ngẫu nhiên một người dùng để gửi SOS
            String email = testEmails[random.nextInt(testEmails.length)];
            String loginJson = String.format("{\"email\":\"%s\",\"password\":\"123\"}", email);

            // Đăng nhập để lấy token
            String loginResponse = sendPost(LOGIN_URL, loginJson, null);
            if (loginResponse == null || !loginResponse.contains("accessToken")) {
                System.out.println("❌ Không thể đăng nhập cho: " + email);
                continue;
            }

            String token = extractToken(loginResponse);
            System.out.println("✅ " + email + " đã sẵn sàng. Đang gửi SOS...");

            // Gửi yêu cầu SOS
            String sosResponse = sendPost(SOS_URL, sos, token);
            System.out.println("📩 Kết quả: " + sosResponse);
        }
        System.out.println("✅ Đã hoàn tất nạp dữ liệu mẫu.");
    }

    private static String sendPost(String urlStr, String jsonBody, String token) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            if (token != null) conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonBody.getBytes());
            }

            return new String(conn.getInputStream().readAllBytes());
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Very simple token extraction (for testing only)
    private static String extractToken(String response) {
        int idx = response.indexOf("accessToken");
        if (idx == -1) return null;
        int start = response.indexOf(":", idx) + 2; // skip colon and opening quote
        int end = response.indexOf("\"", start);
        return response.substring(start, end);
    }
}
