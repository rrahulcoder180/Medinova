
package com.medinova.order;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    private final OrderRepository repository;

    public OrderController(OrderRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public CustomerOrder create(@RequestBody OrderRequest request) {

        CustomerOrder order = new CustomerOrder();

        order.setOrderId("MED-" + (1001 + repository.count()));
        order.setCustomerName(request.customerName);
        order.setAddress(request.address);
        order.setPaymentMethod(request.paymentMethod);
        order.setTotal(request.total);
        order.setStatus("Preparing");
        order.setMessage("Your Medinova order has been received.");

        return repository.save(order);
    }

    @GetMapping
    public List<CustomerOrder> all() {
        return repository.findAll();
    }
}
