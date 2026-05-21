package com.gymmanagement.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Customer {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;
	
	private String clientId;
	
	private String name;
	
	private int age;
	
	private String sex;
	
	private String weight;

	private Double height;

	private Double bodyFat;

	private Double muscleMass;

	private Double waterIntake;

	private Integer calorieTarget;

	private String goal;

	private Double targetWeight;

	private Integer workoutDaysPerWeek;

	private String experienceLevel;

	private String preferredWorkoutType;

	private Boolean reminderEnabled;

	private String reminderTime;

	private String reminderDays;

	private String theme;

	private String weightUnit;

	private String heightUnit;

	private Boolean premium;
	
	private String emailId;
	
	private String contact;
	
	private String address;
	
	@JsonIgnore
	private String password;
	
	private String pic;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getClientId() {
		return clientId;
	}

	public void setClientId(String clientId) {
		this.clientId = clientId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

	public String getSex() {
		return sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	public String getWeight() {
		return weight;
	}

	public void setWeight(String weight) {
		this.weight = weight;
	}

	public Double getHeight() {
		return height;
	}

	public void setHeight(Double height) {
		this.height = height;
	}

	public Double getBodyFat() {
		return bodyFat;
	}

	public void setBodyFat(Double bodyFat) {
		this.bodyFat = bodyFat;
	}

	public Double getMuscleMass() {
		return muscleMass;
	}

	public void setMuscleMass(Double muscleMass) {
		this.muscleMass = muscleMass;
	}

	public Double getWaterIntake() {
		return waterIntake;
	}

	public void setWaterIntake(Double waterIntake) {
		this.waterIntake = waterIntake;
	}

	public Integer getCalorieTarget() {
		return calorieTarget;
	}

	public void setCalorieTarget(Integer calorieTarget) {
		this.calorieTarget = calorieTarget;
	}

	public String getGoal() {
		return goal;
	}

	public void setGoal(String goal) {
		this.goal = goal;
	}

	public Double getTargetWeight() {
		return targetWeight;
	}

	public void setTargetWeight(Double targetWeight) {
		this.targetWeight = targetWeight;
	}

	public Integer getWorkoutDaysPerWeek() {
		return workoutDaysPerWeek;
	}

	public void setWorkoutDaysPerWeek(Integer workoutDaysPerWeek) {
		this.workoutDaysPerWeek = workoutDaysPerWeek;
	}

	public String getExperienceLevel() {
		return experienceLevel;
	}

	public void setExperienceLevel(String experienceLevel) {
		this.experienceLevel = experienceLevel;
	}

	public String getPreferredWorkoutType() {
		return preferredWorkoutType;
	}

	public void setPreferredWorkoutType(String preferredWorkoutType) {
		this.preferredWorkoutType = preferredWorkoutType;
	}

	public Boolean getReminderEnabled() {
		return reminderEnabled;
	}

	public void setReminderEnabled(Boolean reminderEnabled) {
		this.reminderEnabled = reminderEnabled;
	}

	public String getReminderTime() {
		return reminderTime;
	}

	public void setReminderTime(String reminderTime) {
		this.reminderTime = reminderTime;
	}

	public String getReminderDays() {
		return reminderDays;
	}

	public void setReminderDays(String reminderDays) {
		this.reminderDays = reminderDays;
	}

	public String getTheme() {
		return theme;
	}

	public void setTheme(String theme) {
		this.theme = theme;
	}

	public String getWeightUnit() {
		return weightUnit;
	}

	public void setWeightUnit(String weightUnit) {
		this.weightUnit = weightUnit;
	}

	public String getHeightUnit() {
		return heightUnit;
	}

	public void setHeightUnit(String heightUnit) {
		this.heightUnit = heightUnit;
	}

	public Boolean getPremium() {
		return premium;
	}

	public void setPremium(Boolean premium) {
		this.premium = premium;
	}

	public String getEmailId() {
		return emailId;
	}

	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}

	public String getContact() {
		return contact;
	}

	public void setContact(String contact) {
		this.contact = contact;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}


	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPic() {
		return pic;
	}

	public void setPic(String pic) {
		this.pic = pic;
	}

	@Override
	public String toString() {
		return "Customer [id=" + id + ", clientId=" + clientId + ", name=" + name + ", age=" + age + ", sex=" + sex
				+ ", weight=" + weight + ", emailId=" + emailId + ", contact=" + contact + ", address=" + address
				+ ", password=***, pic=" + pic + "]";
	}

	
}
