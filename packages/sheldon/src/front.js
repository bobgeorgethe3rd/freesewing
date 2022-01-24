export default function (part) {
  let { measurements, options, sa, Point, points, Path, paths, complete, paperless, macro, store } =
    part.shorthand()

if (!options.draftPocket){
delete paths.pocket
delete paths.__paperless6
delete paths.__paperless6_le
delete paths.__paperless6_ls
delete paths.__paperless7
delete paths.__paperless7_le
delete paths.__paperless7_ls
delete paths.__paperless9
delete paths.__paperless9_le
delete paths.__paperless9_ls
}


 // Complete pattern?
  if (complete) {
    if (sa) {
   }
}
	
  // Paperless?
  if (paperless) {

  }

  return part
}
