# Build stage: Maven with Temurin JDK 24
FROM maven:3.9.4-eclipse-temurin-24 AS builder
WORKDIR /build

# Copy only what we need for a Maven build
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src src

# Package the application (skip tests in CI by default)
RUN mvn -B -DskipTests package

# Run stage: Temurin JRE 24
FROM eclipse-temurin:24-jre-jammy
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /build/target/*.jar app.jar

ENV JAVA_OPTS=""

# Render will provide the PORT env var; fallback to 8080 if not set
EXPOSE 8080

CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app.jar"]
