import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'jdate'})
export class JDatePipe implements PipeTransform {
  transform(value: any, args: string[]): string {
    if (!value) return value;
    return new Date(value.epochSecond * 1000).toLocaleString();
  }
}