# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy parent and module pom.xml for caching dependencies
COPY pom.xml .
COPY eureka-server/pom.xml eureka-server/
RUN mvn -B dependency:go-offline -pl eureka-server -am || true

# Copy source and build
COPY eureka-server/src eureka-server/src
RUN mvn -B clean package -DskipTests -pl eureka-server -am

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/eureka-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
