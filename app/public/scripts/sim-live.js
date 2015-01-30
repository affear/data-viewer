document.querySelector('#live-template').addEventListener('template-bound', function() {

    // HTML Elements
    var template = document.querySelector('#live-template');
    var sim_live = document.querySelector('#sim-live');
    var error_message = document.querySelector('#no-running-msg');

    // Firebase references
    var bifrost = new Firebase('https://bifrost.firebaseio.com');
    var running_ref = bifrost.child('running');
    var last_sim_id_ref = bifrost.child('last_sim_id');
    var sims_ref = bifrost.child('sims');

    // Template data-binding
    template.proxies = [];


    // Chek if a sim is running
    running_ref.on('value', function(data) {
        // Running
        if (data.val()) {
            sim_live.style.display = 'block';
            error_message.style.display = 'none';
            console.log('Simulation is running');
            _showLiveSim();
        }
        // Non Running
        else {
            sim_live.style.display = 'none';
            error_message.style.display = 'block';
            console.log('No simulation is running');
        }
    });


    var _showLiveSim = function() {

        last_sim_id_ref.once('value', function(data) {

            initLineCharts();

            var last_sim_id = data.val();

            var last_sim_ref = bifrost.child('sims/' + last_sim_id);
            var last_sim_proxies_ref = last_sim_ref.child('proxies');

            // Update charts
            last_sim_proxies_ref.on('child_added', function(data) {
                var new_proxy = {
                    id: data.key(),
                    val: data.val()
                }

                template.proxies.push(new_proxy);

                // initBarCharts();

                var new_proxy_line_chart = $('#line-chart' + new_proxy.id);
                new_proxy_line_chart.ready(function(){
                    console.log($('#line-chart' + new_proxy.id)[0]);
                })

                function _update_chart() {
                    // Updating Sanpshots
                    var snapshot_count = 0;
                    new_proxy_snapshots_ref = last_sim_proxies_ref.child(new_proxy.id + '/snapshots');
                    new_proxy_snapshots_ref.on('child_added', function(data) {
                        var new_snapshot = {
                            id: data.key(),
                            val: data.val()
                        }

                        // var new_proxy_bar_chart = document.querySelector('#bar-chart' + new_proxy.id);

                        var command = new_snapshot.val.command;

                        // LINE CHART
                        // Get data
                        var avg_r_local_gb = new_snapshot.val.avg_r_local_gb * 1000;
                        var avg_r_memory_mb = new_snapshot.val.avg_r_memory_mb * 1000;
                        var avg_r_vcpus = new_snapshot.val.avg_r_vcpus * 1000;
                        var no_active_cmps = new_snapshot.val.no_active_cmps;

                        // Add to the chart
                        // console.log(new_proxy_line_chart);
                        new_proxy_line_chart[0].addData([avg_r_local_gb, avg_r_memory_mb, avg_r_vcpus, no_active_cmps], new_snapshot.id);

                        // BAR CHART

                        var cmps = new_snapshot.val.cmps;
                        // template.barChartInitData.datasets[0].data= [Math.random() * 100,Math.random() * 100,Math.random() * 100]

                    });
                }

                //new_proxy_line_chart.ready(_update_chart);

            });
        });
    }

    var initLineCharts = function() {
        template.lineChartInitData = {
            datasets: [{
                label: "avg_r_local_gb",
                fillColor: "rgba(244, 67, 54, 0.2)",
                strokeColor: "rgba(244, 67, 54, 1)",
                pointColor: "rgba(244, 67, 54, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(244, 67, 54, 1)",
            }, {
                label: "avg_r_memory_mb",
                fillColor: "rgba(62, 83, 175, 0.2)",
                strokeColor: "rgba(62, 83, 175, 1)",
                pointColor: "rgba(62, 83, 175, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(62, 83, 175, 1)",
            }, {
                label: "avg_r_vcpus",
                fillColor: "rgba(65, 174, 93, 0.2)",
                strokeColor: "rgba(65, 174, 93, 1)",
                pointColor: "rgba(65, 174, 93, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(65, 174, 93, 1)",
            }, {
                label: "cmps",
                fillColor: "rgba(255, 191, 66, 0.2)",
                strokeColor: "rgba(255, 191, 66, 1)",
                pointColor: "rgba(255, 191, 66, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255, 191, 66, 1)",
            }, ]
        };
    }

    var initBarCharts = function() {
        template.barChartInitData = {
            labels: [1, 2, 3],
            datasets: [{
                data: [1, 2, 3],
                label: "avg_r_local_gb",
                fillColor: "rgba(244, 67, 54, 0.2)",
                strokeColor: "rgba(244, 67, 54, 1)",
                pointColor: "rgba(244, 67, 54, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(244, 67, 54, 1)",
            }]
        }
    }
});
