data <- read.csv("./random-wspd-2.csv")

# setup window
par(mfrow=c(2,2))

t <- data[,1]
n <- log(data[,2])
k <- data[,3]
ms <- log(data[,6])
n4 = function(n) { 4*n }
n3 = function(n) { 3*n }
n2 = function(n) { 2*n }

plot(
	xlim=c(0, max(n) + 5),
	ylim=c(0, max(ms) + 5),
	xaxs="i",
	yaxs="i",
	xlab="log(n)", ylab="log(ms)", 
	col="#2c7bb6",
	n, ms
)
# lines(col="#d7191c", (0:500), n2(0:500))
lines(col="#fdae61", (2:502), n3(0:500))
lines(col="#abd9e9", (2:502), n4(0:500))

legend(7.5,17, # places a legend at the appropriate place 
legend=c(expression(paste("n"^"3")),expression(paste("n"^"4"))), # puts text in the legend
lty=c(1,1), # gives the legend appropriate symbols (lines)
lwd=c(2,2),
col=c("#fdae61","#abd9e9"))

title("WSPD");

# abline(lm(ms ~ n))

data <- read.csv("./random-greedy-2.csv")

t <- data[,1]
n <- log(data[,2])
k <- data[,3]
ms <- log(data[,6])

plot(
	xlim=c(0, max(n) + 5),
	ylim=c(0, max(ms) + 5),
	xaxs="i",
	yaxs="i",
	xlab="log(n)", ylab="log(ms)", 
	col="#2c7bb6",
	n, ms
)
# lines(col="#d7191c", (0:500), n2(0:500))
lines(col="#fdae61", (0:500), n3(0:500))
lines(col="#abd9e9", (0:500), n4(0:500))

legend(7.5,17, # places a legend at the appropriate place 
legend=c(expression(paste("n"^"3")),expression(paste("n"^"4"))), # puts text in the legend
lty=c(1,1), # gives the legend appropriate symbols (lines)
lwd=c(2,2),
col=c("#fdae61","#abd9e9"))

title("Greedy");
# abline(lm(ms ~ n))