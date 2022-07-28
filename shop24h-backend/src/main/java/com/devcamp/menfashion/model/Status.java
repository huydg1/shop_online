package com.devcamp.menfashion.model;

import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "status")
public class Status {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotNull(message = "Input status name")
	@Column(name = "status_name")
	private String statusName;

	@OneToMany(mappedBy = "status")
	@JsonIgnore
	private List<Order> orders;

	public Status() {

	}

	public Status(long id, String statusName, List<Order> orders) {
		this.id = id;
		this.statusName = statusName;
		this.orders = orders;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getStatusName() {
		return statusName;
	}

	public void setStatusName(String statusName) {
		this.statusName = statusName;
	}

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
	}

}
