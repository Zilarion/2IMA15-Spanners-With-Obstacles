data = read.table("./results-greedy.csv", header=T, sep=",")
dataSize = length(rownames(data))
xlabels = array()
x = array()
y = array()
for(i in 1:dataSize){
	t = data[i,1]
	n = data[i,2]
	k = data[i,3]
	ms = data[i,6]
	nString = paste("n", n, sep=":")
	kString = paste("k", k, sep=":")
	tString = paste("t", t, sep=":")
	xlabels[i] = paste(nString, kString, tString, sep="\n")
	y[i] = ms
	x[i] = ((n+k)^2)*log(n+k)
}
plot(x, y,type="p", col="red", xlab="", ylab="")
#axis(1, at=x[1:dataSize], labels=xlabels[1:dataSize], padj=0.55)
title("Results", xlab="((n+k)^2)*log(n+k)", ylab="ms")
