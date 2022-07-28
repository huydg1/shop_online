package com.devcamp.menfashion.model;

import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "status_rate")
public class StatusRate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotNull(message = "Input status rate name")
	@Column(name = "status_rate_name")
	private String statusRateName;

	@OneToMany(mappedBy = "statusRate")
	@JsonIgnore
	private List<Rate> rates;

	public StatusRate() {

	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getStatusRateName() {
		return statusRateName;
	}

	public void setStatusRateName(String statusRateName) {
		this.statusRateName = statusRateName;
	}

	public List<Rate> getRates() {
		return rates;
	}

	public void setRates(List<Rate> rates) {
		this.rates = rates;
	}

}
