package pe.farmagest.ventas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            if (jwtService.isTokenValid(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtService.extractUsername(jwt);
                List<String> roles = jwtService.extractRoles(jwt);
                Long userId = jwtService.extractUserId(jwt);
                Integer sucursalId = jwtService.extractSucursalId(jwt);

                List<SimpleGrantedAuthority> authorities = roles != null
                        ? roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
                        : List.of();

                UserPrincipal principal = new UserPrincipal(userId, username, sucursalId, roles);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception ignored) {
            // Token inválido o expirado
        }

        filterChain.doFilter(request, response);
    }

    public static class UserPrincipal {
        private final Long userId;
        private final String username;
        private final Integer sucursalId;
        private final List<String> roles;

        public UserPrincipal(Long userId, String username, Integer sucursalId, List<String> roles) {
            this.userId = userId;
            this.username = username;
            this.sucursalId = sucursalId;
            this.roles = roles;
        }

        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public Integer getSucursalId() { return sucursalId; }
        public List<String> getRoles() { return roles; }
    }
}
