data <- read.csv("./random-wspd.csv")

# setup window
par(mfrow=c(2,2))

t <- data[,1]
n <- log(data[,2])
k <- data[,3]
ms <- log(data[,6])
n4 = function(n) { 4*n }
n3 = function(n) { 3*n }

plot(
	xlim=c(0, max(n)),
	ylim=c(0, max(ms)),
	xlab="log(n)", ylab="log(ms)", 
	col="red",
	n, ms
)
lines(col="green", (0:400), n3(0:400))
lines(col="red", (0:400), n4(0:400))
title("WSPD");
# abline(lm(log(ms) ~ log(n)))

data <- read.csv("./random-greedy.csv")

t <- data[,1]
n <- log(data[,2])
k <- data[,3]
ms <- log(data[,6])

plot(
	xlim=c(0, max(n)),
	ylim=c(0, max(ms)),
	xlab="log(n)", ylab="log(ms)", 
	col="red",
	n, ms
)
lines(col="green", (0:400), n3(0:400))
lines(col="red", (0:400), n4(0:400))
title("Greedy");
# abline(lm(log(ms) ~ log(n)))