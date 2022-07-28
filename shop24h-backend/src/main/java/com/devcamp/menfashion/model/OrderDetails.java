package com.devcamp.menfashion.model;

import java.math.BigDecimal;

import javax.persistence.*;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "order_details")
public class OrderDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne
	@JoinColumn(name = "order_id", nullable = false)
	@JsonIgnore
	private Order order;

	@ManyToOne
	@JoinColumn(name = "product_id", nullable = false)
	@JsonIgnore
	private Product product;

	@Transient
	private String productName;

	@Transient
	private long idProduct;

	@Min(message = "Input least 1 quantity order", value = 1)
	@Column(name = "quantity_order")
	private int quantityOrder;

	@NotNull(message = "Input price each")
	@DecimalMin(value = "0.0", inclusive = false, message = "Input price each > 0")
	@Column(name = "price_each")
	private BigDecimal priceEach;

	public OrderDetails() {

	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Order getOrder() {
		return order;
	}

	public void setOrder(Order order) {
		this.order = order;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public int getQuantityOrder() {
		return quantityOrder;
	}

	public void setQuantityOrder(int quantityOrder) {
		this.quantityOrder = quantityOrder;
	}

	public BigDecimal getPriceEach() {
		return priceEach;
	}

	public void setPriceEach(BigDecimal priceEach) {
		this.priceEach = priceEach;
	}

	public String getProductName() {
		return getProduct().getProductName();
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public long getIdProduct() {
		return getProduct().getId();
	}

	public void setIdProduct(long idProduct) {
		this.idProduct = idProduct;
	}

}
