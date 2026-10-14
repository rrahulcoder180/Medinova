package com.medinova.config;

import com.medinova.medicine.Medicine;
import com.medinova.medicine.MedicineRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner loadMedicines(MedicineRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Medicine("Ibuprofen", "Tablets", 49.0,
                        "Pain and fever relief tablets.", "💊", false));
                repo.save(new Medicine("Paracetamol", "Tablets", 30.0,
                        "Common fever and pain relief medicine.", "💊", true));
                repo.save(new Medicine("Vitamin C", "Wellness", 120.0,
                        "Vitamin C supplement.", "🟠", false));
                repo.save(new Medicine("First Aid Kit", "First Aid", 299.0,
                        "Basic emergency first aid kit.", "🩹", true));
                repo.save(new Medicine("Cough Syrup", "Syrup", 95.0,
                        "Cough relief syrup.", "🧴", false));
                repo.save(new Medicine("Biotin", "Wellness", 210.0,
                        "Biotin wellness supplement.", "🔵", false));
            }
        };
    }
}
