
package com.medinova.order;

import com.medinova.auth.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository
        extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByUser(AppUser user);
}
