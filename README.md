# Grass Field Simulation

Time to touch some grass, well not literally but....it's a Grass Simulation

A Grass Simulation Experiment with a Toon Realism vibe and wind effects. Not only, one can simulate with different counts of grass blades but also adjust wind speeds. Winds that carry story of time over the entire field. Inspired by The Legend of Zelda: Breath of the Wild and Ghost of Tsushima

<div align="center">
<table>
  <tbody>
    <tr>
      <td >
        <img src="images/zelda.jpg" width="100%">
        <p style="text-align: center; font-style: italic; font-size: 14px; color: #555;">
          Breath of the Wild
        </p>
      </td>
      <td>
        <img src="images/tsushima.jpg" width="100%">
        <p style="text-align: center; font-style: italic; font-size: 14px; color: #555;">
          Ghost of Tsushima
        </p>
      </td>
    </tr>
  </tbody>
</table>
</div>

In this simulation, one can simulate 5 counts of Grass Strands: 100k, 200k, 300k, 400k, 500k and 10 levels of wind speed from 0 to 10. In addition to that, the world is explorable! Feel free to use keyboard and mouse to move around the 100 x 100 Grass Field

## Simulation Instructions

Stats Panel: Present in the Top Left Corner of the screen, will display the metrics such as FPS, per frame MS etc..
Configuration Panel: Present in the Top Right Corner of the screen, will display the simulation paramenters namely: Grass Blade Count and Wind Speed

- Open the URL where the simulation is hosted
- The simulation is initilized with 100k blades and Wind Speed 2
- Use WASD keyboard to move around and mouse to decide the direction to move towards

## Performance Metrics

System Information: 
- CPU: 13th Gen Intel(R) Core(TM) i7-13700HX
- GPU: NVIDIA GeForce RTX 4050 Laptop GPU
- RAM: 16GB, SSD

Performance Results:
<div align="center">
<table>
  <thead>
    <tr>
      <th>100k</th>
      <th>300k</th>
      <th>500k</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>  
        <img src="https://raw.githubusercontent.com/irrevocablesake/Grass-Field-Simulation/master/images/100k.png" width="100%">
        <p style="text-align: center; font-style: italic; font-size: 14px; color: #555;">
          FPS 160
        </p>
      </td>
      <td>
        <img src="https://raw.githubusercontent.com/irrevocablesake/Grass-Field-Simulation/master/images/300k.png" width="100%">
        <p style="text-align: center; font-style: italic; font-size: 14px; color: #555;">
          FPS 110
        </p>
      </td>
      <td>
        <img src="https://raw.githubusercontent.com/irrevocablesake/Grass-Field-Simulation/master/images/500k.png" width="100%">
        <p style="text-align: center; font-style: italic; font-size: 14px; color: #555;">
          FPS 90
        </p>
      </td>
    </tr>
  </tbody>
</table>
</div>

Memory:
The JS Heap Memory hovers around 6.3MB to 9.3MB. Depending upong the Grass Strand count and movement


