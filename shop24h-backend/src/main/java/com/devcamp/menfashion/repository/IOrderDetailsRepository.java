package com.devcamp.menfashion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.devcamp.menfashion.model.OrderDetails;

public interface IOrderDetailsRepository extends JpaRepository<OrderDetails, Long> {
	List<OrderDetails> findByOrderId(Long orderId);

	// Query xem order detail  bởi orderCode
	@Query(value = "SELECT\r\n" + "    o.order_code AS orderCode,\r\n" + "    o.order_date AS DATE,\r\n"
			+ "    pr.image_url AS imageUrl,\r\n" + "    pr.product_name AS product, pr.id AS productId,\r\n"
			+ "    cs.color_name AS color,\r\n" + "    ors.quantity_order AS quantity,\r\n"
			+ "    ors.price_each AS price,\r\n" + "    ors.quantity_order * ors.price_each AS thanhTien,\r\n"
			+ "    o.voucher_code AS voucherCode,\r\n" + "    o.discount,\r\n"
			+ "    o.price_shipped AS priceShipped,\r\n" + "    us.full_name AS fullName,\r\n" + "    us.email,\r\n"
			+ "    us.phone,\r\n" + "    us.address,\r\n" + "    o.note\r\n" + "FROM\r\n" + "    orders o,\r\n"
			+ "    order_details ors,\r\n" + "    users us,\r\n" + "    products pr,\r\n" + "    colors cs\r\n"
			+ "	   WHERE\r\n" + "    o.id = ors.order_id && us.id = o.user_id && \r\n"
			+ "    pr.id = ors.product_id && cs.id = pr.color_id \r\n"
			+ "    && o.order_code = ?1", nativeQuery = true)
	List<IOrderDetailByOrder> findOrderByOrderCode(String orderCode);
}
