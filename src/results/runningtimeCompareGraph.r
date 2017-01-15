data = read.table("C:/Users/Hein/Documents/TUe/Master Q6/Geometric Algorithms (2IMA15)/results.dat", header=T, sep=",")
dataSize = length(rownames(data))
xlabels = 1:dataSize
for(i in 1:dataSize){
	n = data[i,1]
	k = data[i,2]
	t = data[i,3]
	nString = paste("n", n, sep=":")
	kString = paste("k", k, sep=":")
	tString = paste("t", t, sep=":")
	xlabels[i] = paste(nString, kString, tString, sep="\n")
	y[i] = ((n+k)^2)*log(n+k)
}
x = c(1:dataSize)
plot(x, y,type="o", col="blue", xaxt = "n", xlab="", ylab="")
y = data[,4]
lines(x, y,type="o", col="red", xaxt = "n", xlab="", ylab="")
axis(1, at=1:dataSize, labels=xlabels[1:dataSize], padj=0.55)
title("Results", xlab="", ylab="ms")
