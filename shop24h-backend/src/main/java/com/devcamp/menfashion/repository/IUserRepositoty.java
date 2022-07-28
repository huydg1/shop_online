package com.devcamp.menfashion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devcamp.menfashion.model.User;

public interface IUserRepositoty extends JpaRepository<User, Long> {

	/**
	 * method check exists user by phone
	 * 
	 * @param phone
	 * @return true if exists, else return false
	 */
	boolean existsByPhone(String phone);

	/**
	 * method check exists user by email
	 * 
	 * @param email
	 * @return true if exists, else return false
	 */
	boolean existsByEmail(String email);

	/**
	 * method get info user by id and phone
	 * 
	 * @param id
	 * @param phone
	 * @return info user
	 */
	@Query(value = "SELECT * FROM users WHERE id <> ?1 AND phone = ?2", nativeQuery = true)
	Optional<User> findByIdAndPhone(Long id, String phone);

	/**
	 * method get info user by id and email
	 * 
	 * @param id
	 * @param email
	 * @return info user
	 */
	@Query(value = "SELECT * FROM users WHERE id <> ?1 AND email = ?2", nativeQuery = true)
	Optional<User> findByIdAndEmail(Long id, String email);

	/**
	 * method get info user by phone and email
	 * 
	 * @param phone
	 * @param email
	 * @return info user
	 */
	@Query(value = "SELECT * FROM users WHERE phone <> ?1 AND email = ?2", nativeQuery = true)
	Optional<User> findByPhoneAndEmail(String phone, String email);

	/**
	 * method get info user by phone
	 * 
	 * @param phone
	 * @return info user
	 */
	Optional<User> findByPhone(String phone);

	/**
	 * Method get info user by username
	 * 
	 * @param username
	 * @return info user
	 */
	User findByUsername(String username);

	/**
	 * Method get role by userId
	 * 
	 * @param userId
	 * @return role name
	 */
	@Query(value = "SELECT r.role_key\r\n" + "FROM user_role ur, role r\r\n"
			+ "WHERE ur.role_id = r.id && ur.user_id = ?1", nativeQuery = true)
	String findRoleByUserId(Long userId);

	/**
	 * Method get list customer
	 * 
	 * @return list user
	 */
	@Query(value = "SELECT users.* FROM users, user_role "
			+ "WHERE users.id = user_role.user_id AND user_role.role_id = 3 "
			+ "AND users.full_name LIKE %:fullName% AND users.phone LIKE %:phone%", nativeQuery = true)
	Page<User> findCustomerByFullNameAndPhone(@Param("fullName") String fullName, @Param("phone") String phone,
			Pageable pageable);

	/**
	 * method get list user have role ROLE_ADMIN by fullName and phone
	 * 
	 * @param fullName user input
	 * @param phone    user input
	 * @param pageable user select
	 * @return list user
	 */
	@Query(value = "SELECT users.id, full_name as fullName, phone, email, address, gender, birthday, height, weight, role_id as roleId "
			+ "FROM users, user_role WHERE users.id = user_role.user_id AND user_role.role_id <> 3 "
			+ "AND users.full_name LIKE %:fullName% AND users.phone LIKE %:phone%", nativeQuery = true)
	Page<IUserRole> findUserByFullNameAndPhone(@Param("fullName") String fullName, @Param("phone") String phone,
			Pageable pageable);

	/**
	 * Method get list count order of each user
	 * 
	 * @return List<IUserCountOrder>
	 */
	@Query(value = "SELECT us.full_name AS fullName, COUNT(od.user_id) AS countOrder " + "FROM orders od, users us "
			+ "WHERE us.id = od.user_id AND DATE_FORMAT(od.order_date, '%m/%d/%Y') BETWEEN ?1 AND ?2 "
			+ "GROUP BY od.user_id", nativeQuery = true)
	List<IUserCountOrder> countOrderByUser(String dateMin, String dateMax);

	/**
	 * Method get list report sum money of each user
	 * 
	 * @param money
	 * @return List<IUserSumMoney>
	 */
	@Query(value = "SELECT\r\n" + "    totaByDate.fullName,\r\n" + "    SUM(totaByDate.totalMoney) AS totalOrder\r\n"
			+ "FROM\r\n" + "    (\r\n" + "    SELECT\r\n" + "        us.full_name AS fullName,\r\n" + "        SUM(\r\n"
			+ "            ods.quantity_order * ods.price_each\r\n" + "        ) AS totalMoney\r\n" + "    FROM\r\n"
			+ "        orders od,\r\n" + "        users us,\r\n" + "        order_details ods\r\n" + "    WHERE\r\n"
			+ "        od.id = ods.order_id AND us.id = od.user_id AND DATE_FORMAT(od.order_date, '%m/%d/%Y') BETWEEN ?1 AND ?2\r\n"
			+ "    GROUP BY\r\n" + "        ods.order_id\r\n" + ") AS totaByDate\r\n" + "GROUP BY\r\n"
			+ "    totaByDate.fullName\r\n" + "HAVING\r\n" + "    totalOrder > ?3", nativeQuery = true)
	List<IUserSumMoney> sumMoneyByUser(String dateMin, String dateMax, Integer money);

}
