# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy only what we need for a Maven build
COPY pom.xml ./
COPY src src

# Package the application (skip tests in CI by default)
RUN mvn -B -DskipTests package

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /build/target/*.jar app.jar

ENV JAVA_OPTS=""

# Render will provide the PORT env var; fallback to 8080 if not set
EXPOSE 8080

CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
