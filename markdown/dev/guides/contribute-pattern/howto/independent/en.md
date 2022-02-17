### Step 1: Check your pattern.

Freesewing has several criteria for patterns on the site. First are [our best practices](guides/best-practices), 
these will just make it easier for others to maintain the pattern overtime but and lessen the work of our translators.
Second is it must scale! Freesewing is used by a variety of creators and as such we try our best to cater to all of them. 
Therefore it is a rule that all freesewing patterns must scale when both blown up or shrunk down. In this regard, any pattern 
with ['mm options'](reference/api/config/options) will automatically being bounced back and required altering to scale.

<Note>

'mm options' still can be used fro your own personal projects but have been depreceated on the site in favour of ['snap options'](reference/api/config/options/pct/snap)

</Note>

### Step 2: Create a fork of freesewing/freesewing.

If not already done so you will need to [create a fork of the freesewing monorepo](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

If you do have a fork make sure your develop branch is up to date by using fetch upstream.

### Step 3: Make a local repository of your fork.

To do this you will first need to [install git commands](https://github.com/git-guides/install-git).
Open command prompt and navigate to the folder you wish your repository to be in
Use [git clone](https://github.com/git-guides/git-clone) in command prompt to make a local copy of your reposiotry .

### Step 4: Create a packages folder

Navigate to the freesewing/packages folder in your local directory (in file explorer).

Create a new folder inside packages named after your pattern. e.g. aaron

<Warning>

The folder must be in lowercase and only your pattern name!

</Warning>

### Step 5: Copy your src & config folders.

Copy your patterns src and config folders into the packages/"your pattern" folder you made in Step 4.

### (Optional Step 6: Create a checklist in your packages folder.

Create a new file in your packages/"your pattern" named pattern-checklist and copy the [new pattern checklist](guides/patternchecklist) into this file. 
Please fill out whilst completing the next steps.

<Note>

If you skip this step we will simply assume you do not wish to maintain your pattern and that we will have to fill in the gaps.  
If you do wish to maintain any part of your pattern please fill this out!

</Note>

### (Optional) Step 7: Add Pattern Docs.

If you have docs to add add them.

### (Optional) Step 8: Fill out pattern options reference form.

If you have a moment it will be most helpful if you can fill out a [pattern options reference form](guides/patternoptionform) so we don't have to either guess or hunt you down for answers on what your pattern options do.

### Step 9: Push your changes.

If all seems good to you it is time to push your changes to your fork.

In command prompt navigate to your local repository and run

`git checkout -b"your pattern name"`

to create a new branch of your fork.

Then you need to add the folders you have created. To this run the following;

`git add packages/"your pattern"`

`git add markdown/org/docs/patterns/"your pattern"`

Then you need to commit these changes;

`git commit -m"New Pattern: "Your Pattern""`

Now to check everthing is ok run;

`git status`

If all seems good and you are ready push the pattern to your github by running;

`git push`

<Note>

You may get prompted to set the upstream when running `git push`, simply follow the instructions you are prompted with to do so.

</Note>

### Step 10: Make a pull request.

Back on github create a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

Please make the title of the pull request clear that it is a new pattern and add a small description.

### Step 11: Make any changes needed.

If all is good your pattern will be merged into the monorepo and will appear on the freesewing website in the next update. However if anything needs changing to make the pattern eligible 
for the website you will get a reply on your pull request (or in discord if you are in the discord) on what needs to be changed. Make any changes you need to either in your fork or in your local repository.

<Note>

Any changes made in your local repository will need to be pushed again to update the pull request.

</Note>
