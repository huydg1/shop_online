package com.devcamp.menfashion.model;

import java.math.BigDecimal;
import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "products")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotNull(message = "Input product code")
	@Column(name = "product_code", unique = true)
	private String productCode;

	@NotEmpty(message = "Input product name")
	@Column(name = "product_name")
	private String productName;

	@ManyToOne
	@JoinColumn(name = "category_id", nullable = false)
	@JsonIgnore
	private Category category;

	@Transient
	private long idCategory;

	@Transient
	private String categoryName;

	@ManyToOne
	@JoinColumn(name = "material_id", nullable = false)
	@JsonIgnore
	private Material material;

	@Transient
	private long idMaterial;

	@Transient
	private String materialName;

	@Transient
	private String description;

	@NotNull(message = "Input price")
	@DecimalMin(value = "0.0", inclusive = false, message = "Input price > 0")
	private BigDecimal price;

	@NotNull(message = "Input price discount")
	@DecimalMin(value = "0.0", inclusive = false, message = "Input price discount > 0")
	@Column(name = "price_discount")
	private BigDecimal priceDiscount;

	private String imageUrl;

	@ManyToOne
	@JoinColumn(name = "color_id", nullable = false)
	@JsonIgnore
	private Color color;

	@Transient
	private long idColor;

	@Transient
	private String colorName;

	@Min(message = "Input least 1 quantity In Stock", value = 1)
	@Column(name = "quantity_in_stock")
	private int quantityInStock;

	@OneToMany(mappedBy = "product")
//	@JsonIgnore
	private List<Image> images;

	@OneToMany(mappedBy = "product")
	@JsonIgnore
	private List<OrderDetails> orderDetails;

	@OneToMany(mappedBy = "product")
//	@JsonIgnore
	private List<Rate> rates;

	public Product() {

	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getProductCode() {
		return productCode;
	}

	public void setProductCode(String productCode) {
		this.productCode = productCode;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public String getCategoryName() {
		return getCategory().getCategoryName();
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public Material getMaterial() {
		return material;
	}

	public void setMaterial(Material material) {
		this.material = material;
	}

	public String getDescription() {
		return getMaterial().getDescription();
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public BigDecimal getPriceDiscount() {
		return priceDiscount;
	}

	public void setPriceDiscount(BigDecimal priceDiscount) {
		this.priceDiscount = priceDiscount;
	}

	public List<Image> getImages() {
		return images;
	}

	public void setImages(List<Image> images) {
		this.images = images;
	}

	public List<OrderDetails> getOrderDetails() {
		return orderDetails;
	}

	public void setOrderDetails(List<OrderDetails> orderDetails) {
		this.orderDetails = orderDetails;
	}

	public List<Rate> getRates() {
		return rates;
	}

	public void setRates(List<Rate> rates) {
		this.rates = rates;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Color getColor() {
		return color;
	}

	public void setColor(Color color) {
		this.color = color;
	}

	public int getQuantityInStock() {
		return quantityInStock;
	}

	public void setQuantityInStock(int quantityInStock) {
		this.quantityInStock = quantityInStock;
	}

	public String getMaterialName() {
		return getMaterial().getMaterialName();
	}

	public void setMaterialName(String materialName) {
		this.materialName = materialName;
	}

	public String getColorName() {
		return getColor().getColorName();
	}

	public void setColorName(String colorName) {
		this.colorName = colorName;
	}

	public long getIdCategory() {
		return getCategory().getId();
	}

	public void setIdCategory(long idCategory) {
		this.idCategory = idCategory;
	}

	public long getIdMaterial() {
		return getMaterial().getId();
	}

	public void setIdMaterial(long idMaterial) {
		this.idMaterial = idMaterial;
	}

	public long getIdColor() {
		return getColor().getId();
	}

	public void setIdColor(long idColor) {
		this.idColor = idColor;
	}

}
