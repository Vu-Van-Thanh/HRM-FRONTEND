import { Pipe, PipeTransform } from '@angular/core';
import { Task } from './project.model';

@Pipe({
  name: 'completed'
})
export class CompletedPipe implements PipeTransform {
  transform(tasks: Task[] | undefined): Task[] {
    if (!tasks) {
      return [];
    }
    return tasks.filter(task => task.status?.toLowerCase() === 'completed');
  }
} 