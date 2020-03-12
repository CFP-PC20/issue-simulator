import { Injectable } from '@angular/core';
import { Bug } from './bug';
import { Observable, throwError } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})

export class BugService {
  private bugs: Observable<Array<Bug>>;
  private bugCollection: AngularFirestoreCollection<Bug>;

  constructor(private afs: AngularFirestore) {
    this.bugCollection = this.afs.collection<Bug>('bugs');
    this.bugs = this.bugCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  // POST
  CreateBug(bug): Promise<DocumentReference> {
    return this.bugCollection.add(bug);
  }

  // GET
  GetIssue(id): Observable<Bug> {
    return this.bugCollection.doc<Bug>(id).valueChanges().pipe(
      take(1),
      map(bug => {
        bug.id = id;
        return bug;
      })
    );
  }

  // GET
  GetIssues(): Observable<Array<Bug>> {
    return this.bugs;
  }

  // PUT
  UpdateBug(id, data: Bug): Promise<void> {
    return this.bugCollection
      .doc(id).update({ issue_message: data.issue_message, issue_name: data.issue_name } );
  }

  // DELETE
  DeleteBug(id): Promise<void> {
    return this.bugCollection.doc(id).delete();
  }

  // Error handling
  errorHandl(error) {
     let errorMessage = '';
     if(error.error instanceof ErrorEvent) {
       // Get client-side error
       errorMessage = error.error.message;
     } else {
       // Get server-side error
       errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
     }
     console.log(errorMessage);
     return throwError(errorMessage);
  }

}
