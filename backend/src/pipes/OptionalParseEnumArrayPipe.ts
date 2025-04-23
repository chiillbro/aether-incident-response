import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class OptionalParseEnumArrayPipe<T extends Record<string, any>> implements PipeTransform<string | undefined, T[] | undefined> {
  constructor(private readonly enumType: T) {}

  transform(value: string | undefined, metadata: ArgumentMetadata): T[] | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined; // Allow empty/missing value
    }

    if (typeof value !== 'string') {
        throw new BadRequestException(`Validation failed (${metadata.type}): ${metadata.data} must be a comma-separated string`);
    }

    const enumValues = Object.values(this.enumType);
    const splitValues = value.split(',');
    const validatedArray: T[] = [];

    for (const val of splitValues) {
      const trimmedVal = val.trim();
      if (!enumValues.includes(trimmedVal as unknown as T)) {
        throw new BadRequestException(`Validation failed: Invalid status value "${trimmedVal}". Allowed values are: ${enumValues.join(', ')}`);
      }
      validatedArray.push(trimmedVal as unknown as T);
    }

    return validatedArray;
  }
}