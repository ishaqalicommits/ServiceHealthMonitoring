# Stage 1: Build Spring Boot JAR with Maven & Java 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy backend pom and download dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and package
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Java 17 JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/servicewatch-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
