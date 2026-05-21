FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn
COPY src src

RUN chmod +x mvnw && ./mvnw -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

ENV DISK_UPLOAD_BASEPATH=/tmp/uploads
RUN mkdir -p /tmp/uploads

COPY --from=build /app/target/gym-management-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
