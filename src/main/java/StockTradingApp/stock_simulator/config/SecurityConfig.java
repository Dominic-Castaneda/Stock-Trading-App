package StockTradingApp.stock_simulator.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import StockTradingApp.stock_simulator.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())  // Disable CSRF protection (for simplicity; not recommended for production)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/register", "/login", "/error").permitAll()  // Allow public access to register, login, and error pages
            .anyRequest().authenticated()  // Protect other endpoints
        )
        .authenticationProvider(authenticationProvider()) // Add the authentication provider here
        .formLogin(form -> form
            .loginPage("/login")  // Custom login page
            .loginProcessingUrl("/login")  // URL to submit username and password (matching the form)
            .defaultSuccessUrl("/dashboard", true)  // Redirect after login
            .failureUrl("/login?error=true")  // Show error on failed login
            .permitAll()
        )
        .logout(logout -> logout
            .logoutUrl("/perform_logout")  // URL to log out
            .logoutSuccessUrl("/login?logout")  // Redirect to login after logout
            .permitAll()
        );

    return http.build();
}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Password encoder for hashing passwords
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    protected void configure(AuthenticationManagerBuilder auth) {
        auth.authenticationProvider(authenticationProvider());
    }
}
