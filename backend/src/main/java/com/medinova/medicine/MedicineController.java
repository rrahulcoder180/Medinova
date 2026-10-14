package com.medinova.medicine;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin
public class MedicineController {

    private final MedicineRepository repository;

    public MedicineController(MedicineRepository repository) {
        this.repository = repository;
    }

    // GET - Get all medicines or search medicines
    @GetMapping
    public List<Medicine> getAll(@RequestParam(required = false) String search) {
        if (search == null || search.isBlank()) {
            return repository.findAll();
        }
        return repository.findByNameContainingIgnoreCase(search);
    }

    // POST - Add a new medicine
    @PostMapping
    public Medicine add(@RequestBody Medicine medicine) {
        return repository.save(medicine);
    }

    // PUT - Update an existing medicine
    @PutMapping("/{id}")
    public Medicine update(@PathVariable Long id, @RequestBody Medicine medicine) {

        Medicine existingMedicine = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        existingMedicine.setName(medicine.getName());
        existingMedicine.setCategory(medicine.getCategory());
        existingMedicine.setPrice(medicine.getPrice());
        existingMedicine.setDescription(medicine.getDescription());
        existingMedicine.setImage(medicine.getImage());
        existingMedicine.setEmergency(medicine.isEmergency());

        return repository.save(existingMedicine);
    }

    // DELETE - Delete a medicine
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {

        if (!repository.existsById(id)) {
            return "Medicine not found";
        }

        repository.deleteById(id);
        return "Medicine deleted successfully";
    }
}