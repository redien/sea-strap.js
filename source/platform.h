
#ifndef SEA_PLATFORM_H
#define SEA_PLATFORM_H

/* Buffer */

/* Constructs a buffer object.
 * returns an invalid buffer if an error occured, otherwise a new buffer with the specified size.
 */
void* sea_platform_buffer_construct(unsigned long size_in_bytes);

/* Constructs a buffer object by copying the passed in data.
 * returns an invalid buffer if an error occured, otherwise a new buffer.
 */
void* sea_platform_buffer_construct_with_buffer(void* data, unsigned long size_in_bytes);

/* Destructs a buffer object
 */
void sea_platform_buffer_destruct(void* buffer);

/* Checks if passed in buffer is valid.
 * returns 1 if the buffer is valid otherwise 0.
 */
int sea_platform_buffer_is_valid(void* buffer);

/* Resizes the buffer to the specified size.
 * returns 1 if the buffer was successfully resized, otherwise 0.
 */
int sea_platform_buffer_resize(void* buffer, unsigned long size_in_bytes);

/* Returns the size of the buffer in bytes
 * returns the size of the buffer in bytes.
 */
unsigned long sea_platform_buffer_size(void* buffer);

/* Returns the buffer data as a C-pointer.
 * returns the buffer data as a C-pointer.
 */
void* sea_platform_buffer_data_as_c_pointer(void* buffer);


/* File I/O */

/* Reads the contents of the file at filepath and returns it in a buffer.
 * returns an invalid buffer if an error occured, otherwise a buffer object with the contents.
 */
void* sea_platform_read_file(const char* filepath);

/* Writes the buffer to the file at filepath.
 * returns 0 if an error occured, otherwise 1.
 */
int sea_platform_write_file(const char* filepath, void* buffer);

#endif
