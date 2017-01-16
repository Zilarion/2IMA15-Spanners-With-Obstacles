data <- read.csv("./results-wspd.csv")


# setup window
par(mfrow=c(1,1))

t <- data[,1]
n <- data[,2]
k <- data[,3]
w <- data[,5]


plot(
	col="red",
	xlab="n", ylab="w", 
	n, w
)
title("Total graph weight")
abline(col="red", lm(w ~ n))

data <- read.csv("./results-greedy.csv")

t <- data[,1]
n <- data[,2]
k <- data[,3]
w <- data[,5]

points(
	col="black",
	xlab="n", ylab="w", 
	n, w
)
abline(col="black", lm(w ~ n))
