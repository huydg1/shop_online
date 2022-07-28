package com.devcamp.menfashion.model;

public class ExistsData {
	private String name;
	private boolean exists;

	public ExistsData() {

	}

	public ExistsData(String name, boolean exists) {
		super();
		this.name = name;
		this.exists = exists;
	}

	public boolean isExists() {
		return exists;
	}

	public void setExists(boolean exists) {
		this.exists = exists;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}
