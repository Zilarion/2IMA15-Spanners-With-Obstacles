data <- read.csv("./results-wspd.csv")

# setup window
par(mfrow=c(2,2))

t <- data[,1]
n <- data[,2]
k <- data[,3]
ms <- data[,6]

c <- n*n*k
plot(
	xlim=range(0, 15),
	ylim=range(0, 15),
	xlab="log(n)", ylab="log(ms)", 
	col="red",
	log(n), log(ms)
)
title("WSPD");
# abline(col="red", lm(ms ~ c))

# plot(
# 	xlab="log(k)", ylab="log(ms)", 
# 	col="red",
# 	log(k), log(ms)
# )
# c <- (n+k)*(n+k)*log(n+k)
# points(
# 	col="green",
# 	c, ms
# )
abline(lm(log(ms) ~ log(n)))

data <- read.csv("./results-greedy.csv")

t <- data[,1]
n <- data[,2]
k <- data[,3]
ms <- data[,6]


plot(
	xlim=range(0, 15),
	ylim=range(0, 15),
	xlab="log(n)", ylab="log(ms)", 
	col="red",
	log(n), log(ms)
)
title("Greedy");
abline(lm(log(ms) ~ log(n)))
# plot(
# 	xlab="log(k)", ylab="log(ms)", 
# 	col="red",
# 	log(k), log(ms)
# )
# c <- n*n*k
# plot(
# 	ylim=range(0, 300),
# 	xlab="c", ylab="s", 
# 	col="red",
# 	c, ms
# )
# abline(col="red", lm(ms ~ c))

# c <- (n+k)*(n+k)*log(n+k)
# points(
# 	col="green",
# 	c, ms
# )
# abline(col="green", lm(ms ~ c))