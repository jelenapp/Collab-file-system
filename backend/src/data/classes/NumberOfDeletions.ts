export class NumberOfDeletions
{
    directoriesDeleted = 0;
    filesDeleted = 0;

    accumulate(other: NumberOfDeletions){
        this.directoriesDeleted = other.directoriesDeleted;
        this.filesDeleted = other.filesDeleted;
    }
}