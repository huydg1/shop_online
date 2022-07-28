package com.devcamp.menfashion.model;

import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "materials")
public class Material {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotNull(message = "Input material name")
	@Column(name = "material_name")
	private String materialName;

	@NotEmpty(message = "Input description")
	private String description;

	@OneToMany(mappedBy = "material")
	@JsonIgnore
	private List<Product> products;

	public Material() {

	}

	public Material(long id, String materialName, String description, List<Product> products) {
		this.id = id;
		this.materialName = materialName;
		this.description = description;
		this.products = products;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getMaterialName() {
		return materialName;
	}

	public void setMaterialName(String materialName) {
		this.materialName = materialName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<Product> getProducts() {
		return products;
	}

	public void setProducts(List<Product> products) {
		this.products = products;
	}

}
