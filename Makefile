all:
	gcc dependencies/duktape-1.0.0/src/duktape.c source/duk.c -Idependencies/duktape-1.0.0/src/ -o duk

