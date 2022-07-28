package com.devcamp.menfashion.model;

public class ErrorData {

	private String status;
	private String notification;

	public ErrorData() {

	}

	public ErrorData(String status, String notification) {
		super();
		this.status = status;
		this.notification = notification;
	}

	public String getNotification() {
		return notification;
	}

	public void setNotification(String notification) {
		this.notification = notification;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
