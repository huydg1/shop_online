package com.devcamp.menfashion.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.devcamp.menfashion.model.Product;

public interface IProductRepository extends JpaRepository<Product, Long> {

	/**
	 * method check exists productCode
	 * 
	 * @param productCode user input
	 * @return true if exists, else return false
	 */
	boolean existsByProductCode(String productCode);

	/**
	 * method get product by id and productCode
	 * 
	 * @param id          user input
	 * @param productCode user input
	 * @return info product
	 */
	@Query(value = "SELECT * FROM products WHERE id <> ?1 AND product_code =?2", nativeQuery = true)
	Optional<Product> findByIdAndProductCode(Long id, String productCode);

	/**
	 * Method get list product by productName (Query: LIKE)
	 * 
	 * @param productName user input
	 * @param pageable    user input
	 * @return list product filter
	 */
	@Query(value = "SELECT * FROM products WHERE product_name LIKE %?1%", nativeQuery = true)
	Page<Product> findByProductName(String productName, Pageable pageable);

	/**
	 * Method get list product by productName and price
	 * 
	 * @param productName user input
	 * @param priceMin    user input
	 * @param priceMax    user input
	 * @param pageable    user input
	 * @return list product filter
	 */
	@Query(value = "SELECT * FROM products WHERE product_name LIKE %?1% AND price_discount BETWEEN ?2 AND ?3", nativeQuery = true)
	Page<Product> findByProductNameAndPrice(String productName, BigDecimal priceMin, BigDecimal priceMax,
			Pageable pageable);

	/**
	 * Method get list product by productName and category
	 * 
	 * @param productName user input
	 * @param category    user input
	 * @param pageable    user input
	 * @return list product filter
	 */
	@Query(value = "SELECT * FROM products WHERE product_name LIKE %?1% AND category_id = ?2", nativeQuery = true)
	Page<Product> findByProductNameAndCategory(String productName, Long categoryId, Pageable pageable);

	/**
	 * Method get list product by category and price
	 * 
	 * @param category user input
	 * @param priceMin user input
	 * @param priceMax user input
	 * @param pageable user input
	 * @return list product filter
	 */
	@Query(value = "SELECT * FROM products WHERE category_id = ?1 AND price_discount BETWEEN ?2 AND ?3", nativeQuery = true)
	Page<Product> findByCategoryAndPrice(Long categoryId, BigDecimal priceMin, BigDecimal priceMax, Pageable pageable);

	/**
	 * Method get list product by productName, category and price
	 * 
	 * @param productName user input
	 * @param category    user input
	 * @param priceMin    user input
	 * @param priceMax    user input
	 * @param pageable    user input
	 * @return list product filter
	 */
	@Query(value = "SELECT * FROM products WHERE product_name LIKE %?1% AND category_id = ?2 "
			+ "AND price_discount BETWEEN ?3 AND ?4", nativeQuery = true)
	Page<Product> findByProductNameAndCategoryAndPrice(String productName, Long categoryId, BigDecimal priceMin,
			BigDecimal priceMax, Pageable pageable);

	List<Product> findByColorId(Long colorId);

	List<Product> findByCategoryId(Long categoryId);

	List<Product> findByColorIdAndCategoryId(Long colorId, Long categoryId);

}
