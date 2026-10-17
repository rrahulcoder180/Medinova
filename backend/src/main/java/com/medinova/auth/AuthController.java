
package com.medinova.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

  public AuthController(
        AppUserRepository repository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager) {

    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.fullName == null || request.fullName.isBlank()
                || request.email == null || request.email.isBlank()
                || request.password == null || request.password.length() < 8) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Name and email are required; password must be at least 8 characters.")
            );
        }

        String email = request.email.trim().toLowerCase();

        if (repository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "An account with this email already exists.")
            );
        }

        AppUser user = new AppUser();
        user.setFullName(request.fullName.trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password));

        repository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of("message", "Account registered successfully.")
        );
    }
 @PostMapping("/login")
public ResponseEntity<?> login(
        @RequestBody LoginRequest request,
        HttpServletRequest httpRequest,
        HttpServletResponse httpResponse) {   

    if (request.email == null || request.email.isBlank()
            || request.password == null || request.password.isBlank()) {
        return ResponseEntity.badRequest().body(
            Map.of("message", "Email and password are required.")
        );
    }

    try {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.email.trim().toLowerCase(),
                request.password
            )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

                HttpSession oldSession = httpRequest.getSession(false);

        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            context
        );

        return ResponseEntity.ok(
            Map.of("message", "Login successful.")
        );

    } catch (org.springframework.security.core.AuthenticationException ex) {
        SecurityContextHolder.clearContext();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            Map.of("message", "Invalid email or password.")
        );
    }
}

@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request) {

    HttpSession session = request.getSession(false);

    if (session != null) {
        session.invalidate();
    }

    SecurityContextHolder.clearContext();

    return ResponseEntity.ok(
        Map.of("message", "Logged out successfully.")
    );
}



@GetMapping("/me")
public ResponseEntity<?> currentUser(
        org.springframework.security.core.Authentication authentication) {

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getName().equals("anonymousUser")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("authenticated", false));
    }

    return repository.findByEmail(authentication.getName())
            .map(user -> ResponseEntity.ok(
                    Map.of(
                            "authenticated", true,
                            "fullName", user.getFullName(),
                            "email", user.getEmail()
                    )))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("authenticated", false)));
}
}