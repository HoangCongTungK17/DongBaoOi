# Stage 1: Build với Maven
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app

# Copy toàn bộ nội dung từ thư mục hiện tại vào container
COPY . .

# Thực hiện build (Lệnh này sẽ tìm pom.xml ở thư mục hiện tại)
RUN mvn clean package -DskipTests

# Stage 2: Chạy ứng dụng
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy file jar đã build từ Stage 1
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]