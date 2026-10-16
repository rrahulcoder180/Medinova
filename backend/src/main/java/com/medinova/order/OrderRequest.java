
package com.medinova.order;

import java.util.List;

public class OrderRequest {
    public String customerName;
    public String address;
    public String paymentMethod;
    public List<OrderItemRequest> items;
}
