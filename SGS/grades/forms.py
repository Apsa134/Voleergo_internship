from django import forms
from .models import Subject,Student,StudentMark

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['name', 'roll_number']


class SubjectForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = ['name', 'max_marks', 'pass_marks']



class StudentMarkForm(forms.ModelForm):

    class Meta:
        model = StudentMark
        fields = ['subject', 'status', 'marks_obtained']

    def clean(self):
        cleaned_data = super().clean()

        status = cleaned_data.get('status')
        marks = cleaned_data.get('marks_obtained')
        subject = cleaned_data.get('subject')

        if status == 'Absent':
            cleaned_data['marks_obtained'] = None

        elif status == 'Present':

            if marks is None:
                self.add_error(
                    'marks_obtained',
                    'Please enter marks for a present student.'
                )

            elif subject and marks > subject.max_marks:
                self.add_error(
                    'marks_obtained',
                    f'Marks cannot exceed {subject.max_marks}.'
                )

        return cleaned_data
