# If n and k are the same for each entry in the table, you can visualize the running times of the algorithms with different t values

data = read.table("./results.dat", header=T, sep=",")
dataSize = length(rownames(data))
xlabels = 1:dataSize
for(i in 1:dataSize){
	xlabels[i] = data[i,3]
}

name = paste("Results from data set n:", data[1,1], "k:", data[1,2], sep=" ")

x = c(1:dataSize)
y = data[,4]
plot(x, y,type="o", col="red", xaxt = "n", xlab="", ylab="")
axis(1, at=1:dataSize, labels=xlabels[1:dataSize], padj=0.55)
title(name, xlab="t", ylab="ms")
