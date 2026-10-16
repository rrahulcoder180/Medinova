

package com.medinova.order;

import com.medinova.auth.AppUser;
import com.medinova.auth.AppUserRepository;
import com.medinova.medicine.Medicine;
import com.medinova.medicine.MedicineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository repository;
    private final AppUserRepository userRepository;
    private final MedicineRepository medicineRepository;

    public OrderController(
            OrderRepository repository,
            AppUserRepository userRepository,
            MedicineRepository medicineRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
    }

    @PostMapping
    public CustomerOrder create(
            @RequestBody OrderRequest request,
            Authentication authentication) {

        AppUser user = getAuthenticatedUser(authentication);

        if (request == null
                || request.customerName == null
                || request.customerName.isBlank()
                || request.address == null
                || request.address.isBlank()
                || request.paymentMethod == null
                || request.paymentMethod.isBlank()
                || request.items == null
                || request.items.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please provide valid checkout details."
            );
        }

        BigDecimal total = BigDecimal.ZERO;
        Set<Long> seenMedicineIds = new HashSet<>();

        for (OrderItemRequest item : request.items) {
            if (item == null
                    || item.medicineId == null
                    || item.quantity < 1
                    || item.quantity > 100
                    || !seenMedicineIds.add(item.medicineId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or duplicate medicine item."
                );
            }

            Medicine medicine = medicineRepository
                    .findById(item.medicineId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "A selected medicine does not exist."
                    ));

            if (!Double.isFinite(medicine.getPrice())
                    || medicine.getPrice() < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid medicine price."
                );
            }

            total = total.add(
                    BigDecimal.valueOf(medicine.getPrice())
                            .multiply(BigDecimal.valueOf(item.quantity))
            );
        }

        if (total.signum() <= 0
                || !Double.isFinite(total.doubleValue())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order total."
            );
        }

        CustomerOrder order = new CustomerOrder();
       order.setOrderId("MED-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomerName(request.customerName.trim());
        order.setAddress(request.address.trim());
        order.setPaymentMethod(request.paymentMethod.trim());
        order.setTotal(total.doubleValue());
        order.setStatus("Preparing");
        order.setMessage("Your Medinova order has been received.");
        order.setUser(user);

        return repository.save(order);
    }

    @GetMapping
    public List<CustomerOrder> all(Authentication authentication) {
        AppUser user = getAuthenticatedUser(authentication);
        return repository.findByUser(user);
    }

    private AppUser getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first."
            );
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Account not found. Please log in again."
                ));
    }
}
