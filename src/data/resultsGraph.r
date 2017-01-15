data = read.table("C:/Users/Hein/Documents/TUe/Master Q6/Geometric Algorithms (2IMA15)/results.dat", header=T, sep=",")
dataSize = length(rownames(data))
xlabels = 1:dataSize
for(i in 1:dataSize){
	n = paste("n", data[i,1], sep=":")
	k = paste("k", data[i,2], sep=":")
	t = paste("t", data[i,3], sep=":")
	xlabels[i] = paste(n, k, t, sep="\n")
}

x = c(1:dataSize)
y = data[,4]
plot(x, y,type="o", col="red", xaxt = "n", xlab="", ylab="")
axis(1, at=1:dataSize, labels=xlabels[1:dataSize], padj=0.55)
title("Results", xlab="", ylab="ms")
