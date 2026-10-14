package com.medinova.medicine;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    private double price;
    private String description;
    private String image;
    private boolean emergency;

    public Medicine() {}

    public Medicine(String name, String category, double price, String description, String image, boolean emergency) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.description = description;
        this.image = image;
        this.emergency = emergency;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public String getDescription() { return description; }
    public String getImage() { return image; }
    public boolean isEmergency() { return emergency; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCategory(String category) { this.category = category; }
    public void setPrice(double price) { this.price = price; }
    public void setDescription(String description) { this.description = description; }
    public void setImage(String image) { this.image = image; }
    public void setEmergency(boolean emergency) { this.emergency = emergency; }
}
