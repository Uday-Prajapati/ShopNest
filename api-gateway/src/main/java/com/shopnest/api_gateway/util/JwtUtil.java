package com.shopnest.api_gateway.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;

@Component
public class JwtUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    
	@Value("${jwt.secret}")
	private String jwtSecret;

	private SecretKey key() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}
    
	public String getUsernameFromToken(String token) {
		try {
			Claims claims = getClaims(token);
			return claims.getSubject();
		} catch (Exception e) {
			logger.error("Error getting username from token: {}", e.getMessage());
			return null;
		}
	}

	/**
	 * Extract roles from JWT authorities claim. Returns comma-separated roles for X-User-Roles header.
	 */
	public String getRolesFromToken(String token) {
		try {
			Claims claims = getClaims(token);
			Object authorities = claims.get("authorities");
			if (authorities == null) return "";
			List<String> roles = new ArrayList<>();
			if (authorities instanceof List<?> list) {
				for (Object item : list) {
					if (item instanceof Map<?, ?> map && map.containsKey("authority")) {
						roles.add(String.valueOf(map.get("authority")));
					} else if (item instanceof String) {
						roles.add((String) item);
					}
				}
			}
			return String.join(",", roles);
		} catch (Exception e) {
			logger.error("Error getting roles from token: {}", e.getMessage());
			return "";
		}
	}

	private Claims getClaims(String token) {
		return Jwts.parser()
				.verifyWith(key())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
    
	public boolean validateToken(String token) {
		try {
			Jwts.parser()
					.verifyWith(key())
					.build()
					.parseSignedClaims(token);
			return !isTokenExpired(token);
		} catch (SignatureException e) {
			logger.error("Invalid JWT signature: {}", e.getMessage());
		} catch (MalformedJwtException e) {
			logger.error("Invalid JWT token: {}", e.getMessage());
		} catch (ExpiredJwtException e) {
			logger.error("JWT token is expired: {}", e.getMessage());
		} catch (UnsupportedJwtException e) {
			logger.error("JWT token is unsupported: {}", e.getMessage());
		} catch (IllegalArgumentException e) {
			logger.error("JWT claims string is empty: {}", e.getMessage());
		}
		return false;
	}
    
	private boolean isTokenExpired(String token) {
		try {
			Claims claims = getClaims(token);
			return claims.getExpiration().before(new Date());
		} catch (Exception e) {
			return true;
		}
	}
}