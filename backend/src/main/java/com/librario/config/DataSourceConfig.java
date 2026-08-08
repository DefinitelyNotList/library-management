package com.librario.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        if (url != null && !url.startsWith("jdbc:")) {
            url = normalizeJdbcUrl(url);
            properties.setUrl(url);
        }

        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    private String normalizeJdbcUrl(String rawUrl) {
        String normalized = rawUrl.trim();
        if (normalized.startsWith("jdbc:")) {
            return normalized;
        }

        Map<String, String> values = parseNameValuePairs(normalized);
        String server = getValue(values, "server");
        String database = getValue(values, "database");

        if (server.isEmpty()) {
            throw new IllegalArgumentException("Invalid SQL Server URL: missing Server=");
        }
        if (database.isEmpty()) {
            throw new IllegalArgumentException("Invalid SQL Server URL: missing Database=");
        }

        String hostPort = server;
        if (!hostPort.contains(":")) {
            hostPort = hostPort + ":1433";
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:sqlserver://").append(hostPort)
                .append(";databaseName=").append(database);

        values.remove("server");
        values.remove("database");

        for (Map.Entry<String, String> entry : values.entrySet()) {
            String key = entry.getKey();
            if (key.equalsIgnoreCase("user id") || key.equalsIgnoreCase("password")) {
                continue;
            }
            jdbcUrl.append(";").append(entry.getKey()).append("=").append(entry.getValue());
        }

        return jdbcUrl.toString();
    }

    private Map<String, String> parseNameValuePairs(String raw) {
        Map<String, String> values = new LinkedHashMap<>();
        Arrays.stream(raw.split(";"))
                .map(String::trim)
                .filter(pair -> !pair.isEmpty() && pair.contains("="))
                .forEach(pair -> {
                    String[] parts = pair.split("=", 2);
                    values.put(parts[0].trim(), parts[1].trim());
                });
        return values;
    }

    private String getValue(Map<String, String> values, String key) {
        for (Map.Entry<String, String> entry : values.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(key)) {
                return entry.getValue();
            }
        }
        return "";
    }
}
