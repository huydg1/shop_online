package com.devcamp.menfashion.repository;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.devcamp.menfashion.model.Rate;

public interface IRateRepository extends JpaRepository<Rate, Long> {

	/**
	 * method get list rate by productId
	 * 
	 * @param productId
	 * @param pageable
	 * @return
	 */
	Page<Rate> findByProductId(Long productId, Pageable pageable);

	/**
	 * method get list rate by productName
	 * 
	 * @param productName
	 * @param pageable
	 * @return
	 */
	@Query(value = "SELECT rates.* FROM rates, products\r\n"
			+ "WHERE rates.product_id = products.id AND products.product_name LIKE %?1%", nativeQuery = true)
	Page<Rate> findByProductName(String productName, Pageable pageable);

	/**
	 * method get list rate by productName and statusId
	 * 
	 * @param productName
	 * @param statusId
	 * @param pageable
	 * @return
	 */
	@Query(value = "SELECT rates.* FROM rates, products WHERE rates.product_id = products.id "
			+ "AND products.product_name LIKE %?1% AND rates.status_rate_id = ?2", nativeQuery = true)
	Page<Rate> findByProductNameAndStatusId(String productName, Long statusId, Pageable pageable);

	/**
	 * method get list rate by userId
	 * 
	 * @param userId
	 * @param pageable
	 * @return
	 */
	@Query(value = "SELECT rates.id, products.image_url AS imageUrl, products.product_name AS productName, "
			+ "		rates.comment, rates.rate, status_rate.status_rate_name as statusRate "
			+ "		FROM products, rates, status_rate "
			+ "		WHERE rates.status_rate_id = status_rate.id && products.id = rates.product_id && rates.user_id = ?1", nativeQuery = true)
	Page<IRateByUser> findByUserId(Long userId, Pageable pageable);

	/**
	 * method get avg rate by productId
	 * 
	 * @param productId
	 * @return
	 */
	@Query(value = "SELECT AVG(r.rate) as trungBinhRate\r\n" + "FROM rates r\r\n" + "GROUP BY r.product_id\r\n"
			+ "HAVING r.product_id = ?1", nativeQuery = true)
	BigDecimal avgRateByProductId(BigDecimal productId);
}
