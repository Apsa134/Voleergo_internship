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

    def clean_name(self):
        name = self.cleaned_data['name'].strip()

        existing_subjects = Subject.objects.filter(
            name__iexact=name
        ).exclude(pk=self.instance.pk)

        if existing_subjects.exists():
            raise forms.ValidationError(
                'This subject has already been added.'
            )

        return name

    def clean(self):
        cleaned_data = super().clean()

        max_marks = cleaned_data.get('max_marks')
        pass_marks = cleaned_data.get('pass_marks')

        if max_marks is not None and max_marks <= 0:
            self.add_error(
                'max_marks',
                'Maximum marks must be greater than zero.'
            )

        if (
            max_marks is not None
            and pass_marks is not None
            and pass_marks > max_marks
        ):
            self.add_error(
                'pass_marks',
                'Pass marks cannot exceed maximum marks.'
            )

        return cleaned_data






class StudentMarkForm(forms.ModelForm):

    def __init__(self, *args, student=None, **kwargs):
        self.student = student
        super().__init__(*args, **kwargs)

    class Meta:
        model = StudentMark
        fields = ['subject', 'status', 'marks_obtained']

    def clean(self):
        cleaned_data = super().clean()

        status = cleaned_data.get('status')
        marks = cleaned_data.get('marks_obtained')
        subject = cleaned_data.get('subject')

        # Validate marks according to attendance status
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

        # Prevent duplicate subject marks for the same student
        student = self.student or getattr(self.instance, 'student', None)

        if student and subject:
            duplicate = StudentMark.objects.filter(
                student=student,
                subject=subject
            ).exclude(pk=self.instance.pk).exists()

            if duplicate:
                self.add_error(
                    'subject',
                    'Marks for this subject have already been added for this student.'
                )

        return cleaned_data
