package com.devcamp.menfashion.model;

import java.util.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import org.springframework.data.annotation.LastModifiedDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(name = "user_name", unique = true)
	private String username;

	@NotNull(message = "Input full name")
	@Column(name = "full_name")
	private String fullName;

	@NotNull(message = "Input phone")
	@Column(unique = true)
	private String phone;

	@NotNull(message = "Input email")
	@Column(unique = true)
	private String email;

	@NotNull(message = "Input address")
	private String address;
	private String gender;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "birthday")
	@LastModifiedDate
	@JsonFormat(pattern = "dd/MM/yyyy")
	private Date birthday;

	private int height;
	private int weight;

	@Column(name = "password")
	private String password;

	@Transient
	private String passwordNew;

	@Transient
	private long roleId;

	@OneToMany(mappedBy = "user")
	@JsonIgnore
	private List<Order> orders;

	@OneToMany(mappedBy = "user")
	@JsonIgnore
	private List<Payment> payments;

	@OneToMany(mappedBy = "user")
	@JsonIgnore
	private List<Rate> rates;

	@OneToMany(mappedBy = "user")
	@JsonIgnore
	private List<ReplyRate> replyRates;

//	@ManyToMany(cascade = CascadeType.REFRESH, fetch = FetchType.EAGER)
//	@JoinTable(name = "user_role", joinColumns = { @JoinColumn(name = "user_id") }, inverseJoinColumns = {
//			@JoinColumn(name = "role_id") })
//	private Set<Role> roles = new HashSet<>();
	@OneToMany(mappedBy = "user")
	@JsonIgnore
	private Set<UserRole> userRoles;

	public User() {

	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public Date getBirthday() {
		return birthday;
	}

	public void setBirthday(Date birthday) {
		this.birthday = birthday;
	}

	public int getHeight() {
		return height;
	}

	public void setHeight(int height) {
		this.height = height;
	}

	public int getWeight() {
		return weight;
	}

	public void setWeight(int weight) {
		this.weight = weight;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
	}

	public List<Payment> getPayments() {
		return payments;
	}

	public void setPayments(List<Payment> payments) {
		this.payments = payments;
	}

//	public Set<Role> getRoles() {
//		return roles;
//	}
//
//	public void setRoles(Set<Role> roles) {
//		this.roles = roles;
//	}

	public List<Rate> getRates() {
		return rates;
	}

	public Set<UserRole> getUserRoles() {
		return userRoles;
	}

//	public void setUserRoles(Set<UserRole> userRoles) {
//		this.userRoles = userRoles;
//	}

	public void setRates(List<Rate> rates) {
		this.rates = rates;
	}

	public List<ReplyRate> getReplyRates() {
		return replyRates;
	}

	public void setReplyRates(List<ReplyRate> replyRates) {
		this.replyRates = replyRates;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPasswordNew() {
		return passwordNew;
	}

	public void setPasswordNew(String passwordNew) {
		this.passwordNew = passwordNew;
	}

	public long getRoleId() {
		return roleId;
	}

}
