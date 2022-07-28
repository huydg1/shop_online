package com.devcamp.menfashion.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.devcamp.menfashion.model.Order;

public interface IOrderRepository extends JpaRepository<Order, Long> {

	/**
	 * method get list report order for week
	 * 
	 * @param dateMin user input
	 * @param dateMax user input
	 * @return list report
	 */
	@Query(value = "SELECT WEEK(od.order_date) as week, SUM(ods.quantity_order * ods.price_each) as tongThanhTien\r\n"
			+ "FROM orders od, order_details ods\r\n"
			+ "WHERE od.id = ods.order_id AND DATE_FORMAT(od.order_date, '%m/%d/%Y') BETWEEN ?1 AND ?2\r\n"
			+ "GROUP BY WEEK(od.order_date)", nativeQuery = true)
	List<IWeekReport> reportOrderWeek(String dateMin, String dateMax);

	/**
	 * method get list report order for month
	 * 
	 * @param dateMin user input
	 * @param dateMax user input
	 * @return list report
	 */
	@Query(value = "SELECT MONTH(od.order_date) as month, SUM(ods.quantity_order * ods.price_each) as tongThanhTien\r\n"
			+ "FROM orders od, order_details ods\r\n"
			+ "WHERE od.id = ods.order_id AND DATE_FORMAT(od.order_date, '%m/%d/%Y') BETWEEN ?1 AND ?2\r\n"
			+ "GROUP BY MONTH(od.order_date)", nativeQuery = true)
	List<IMonthReport> reportOrderMonth(String dateMin, String dateMax);

	/**
	 * method get list report order for date
	 * 
	 * @param dateMin user input
	 * @param dateMax user input
	 * @return list report
	 */
	@Query(value = "SELECT DATE_FORMAT(od.order_date, '%m/%d/%Y') as date, SUM(ods.quantity_order * ods.price_each) as tongThanhTien\r\n"
			+ "FROM orders od, order_details ods\r\n" + "WHERE od.id = ods.order_id\r\n"
			+ "GROUP BY DATE(od.order_date)\r\n" + "HAVING date BETWEEN ?1 AND ?2", nativeQuery = true)
	List<IDateReport> reportOrderDate(String dateMin, String dateMax);

	/**
	 * method get list order by user
	 * 
	 * @param userId   user input
	 * @param pageable user input
	 * @return list order
	 */
	@Query(value = "SELECT orders.id, orders.order_code AS orderCode, orders.order_date AS orderDate, status.status_name AS statusName,\r\n"
			+ "    orders.discount,  orders.price_shipped AS priceShipped,\r\n"
			+ "    (SUM(order_details.quantity_order * order_details.price_each) + orders.price_shipped) AS tongTien\r\n"
			+ "FROM orders, order_details, status\r\n"
			+ "WHERE orders.id = order_details.order_id && orders.status_id = status.id && orders.user_id = ?1\r\n"
			+ "GROUP BY orders.order_code", nativeQuery = true)
	Page<IOrderByUser> findOrderByUserId(Long userId, Pageable pageable);

	/**
	 * method get list order by filter fullName, phone, orderDate statusId
	 * 
	 * @param fullName
	 * @param phone
	 * @param orderDate
	 * @param statusId
	 * @param pageable
	 * @return list order
	 */
	@Query(value = "SELECT orders.id, DATE_FORMAT(orders.order_date, '%d/%m/%Y') AS orderDate,\r\n"
			+ "    DATE_FORMAT(orders.expected_shipped_date,'%d/%m/%Y') AS expectedShippedDate,\r\n"
			+ "    orders.voucher_code AS voucherCode, orders.discount, orders.price_shipped AS priceShipped,\r\n"
			+ "    orders.note, orders.order_code AS orderCode, users.full_name AS fullName, \r\n"
			+ "    orders.user_id AS idUser, status.status_name AS statusName\r\n" + "FROM orders, users, status\r\n"
			+ "WHERE orders.user_id = users.id && orders.status_id = status.id \r\n"
			+ "AND users.full_name LIKE %?1% AND users.phone LIKE %?2% \r\n"
			+ "AND DATE_FORMAT(orders.order_date, '%d/%m/%Y') LIKE %?3% AND orders.status_id = ?4", nativeQuery = true)
	Page<IOrder> findByFullNameAndPhoneAndOrderDateAndStatusId(String fullName, String phone, String orderDate,
			Long statusId, Pageable pageable);

	/**
	 * method get list order by filter fullName, phone, orderDate
	 * 
	 * @param fullName
	 * @param phone
	 * @param orderDate
	 * @param pageable
	 * @return
	 */
	@Query(value = "SELECT orders.id, DATE_FORMAT(orders.order_date, '%d/%m/%Y') AS orderDate,\r\n"
			+ "    DATE_FORMAT(orders.expected_shipped_date,'%d/%m/%Y') AS expectedShippedDate,\r\n"
			+ "    orders.voucher_code AS voucherCode, orders.discount, orders.price_shipped AS priceShipped,\r\n"
			+ "    orders.note, orders.order_code AS orderCode, users.full_name AS fullName, \r\n"
			+ "    orders.user_id AS idUser, status.status_name AS statusName\r\n" + "FROM orders, users, status\r\n"
			+ "WHERE orders.user_id = users.id && orders.status_id = status.id \r\n"
			+ "AND users.full_name LIKE %?1% AND users.phone LIKE %?2% \r\n"
			+ "AND DATE_FORMAT(orders.order_date, '%d/%m/%Y') LIKE %?3%", nativeQuery = true)
	Page<IOrder> findByFullNameAndPhoneAndOrderDate(String fullName, String phone, String orderDate, Pageable pageable);

}
